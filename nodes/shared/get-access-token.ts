import type { IExecuteFunctions } from 'n8n-workflow';
import { createSign } from 'crypto';
import { NodeOperationError } from 'n8n-workflow';

function readCredentialValue(credentials: Record<string, unknown>, keys: string[]): string | undefined {
	for (const key of keys) {
		const value = credentials[key];
		if (typeof value === 'string' && value.trim() !== '') return value;
	}

	return undefined;
}

function normalizePrivateKey(value: string): string {
	return value.includes('\\n') ? value.replace(/\\n/g, '\n') : value;
}

function base64Url(value: string): string {
	return Buffer.from(value)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');
}

function createServiceAccountJwt(clientEmail: string, privateKey: string, scope: string): string {
	const nowInSeconds = Math.floor(Date.now() / 1000);
	const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const payload = base64Url(
		JSON.stringify({
			iss: clientEmail,
			scope,
			aud: 'https://oauth2.googleapis.com/token',
			iat: nowInSeconds,
			exp: nowInSeconds + 3600,
		}),
	);

	const unsignedToken = `${header}.${payload}`;
	const signer = createSign('RSA-SHA256');
	signer.update(unsignedToken);
	signer.end();
	const signature = signer
		.sign(privateKey, 'base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');

	return `${unsignedToken}.${signature}`;
}

export async function getGoogleServiceAccountAccessToken(
	context: IExecuteFunctions,
	itemIndex: number,
	scope: string,
): Promise<string> {
	const credentials = (await context.getCredentials('gcpServiceAccountApi')) as Record<string, unknown>;
	const clientEmail = readCredentialValue(credentials, ['clientEmail', 'client_email', 'email']);
	const privateKey = readCredentialValue(credentials, ['privateKey', 'private_key']);

	if (!clientEmail || !privateKey) {
		throw new NodeOperationError(
			context.getNode(),
			'Missing Client Email or Private Key in Google credentials.',
			{ itemIndex },
		);
	}

	const assertion = createServiceAccountJwt(clientEmail, normalizePrivateKey(privateKey), scope);
	const formBody = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(assertion)}`;
	const tokenResponse = (await context.helpers.httpRequest({
		method: 'POST',
		url: 'https://oauth2.googleapis.com/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: formBody,
		json: false,
	})) as string;

	let parsedToken: { access_token?: string };
	try {
		parsedToken = JSON.parse(tokenResponse) as { access_token?: string };
	} catch {
		throw new NodeOperationError(
			context.getNode(),
			`Could not parse Google token response: ${tokenResponse}`,
			{ itemIndex },
		);
	}

	if (!parsedToken.access_token) {
		throw new NodeOperationError(context.getNode(), `Google token response missing access token: ${tokenResponse}`, {
			itemIndex,
		});
	}

	return parsedToken.access_token;
}
