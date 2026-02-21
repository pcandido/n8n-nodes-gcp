import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { createSign } from 'crypto';
import { NodeOperationError } from 'n8n-workflow';
import { getGcpServiceAccountCredentials } from './get-access-token';

function encodeObjectPath(filePath: string): string {
	return filePath
		.split('/')
		.filter((part) => part.length > 0)
		.map((part) => encodeURIComponent(part))
		.join('/');
}

export async function createV2SignedUrl(
	context: IExecuteFunctions,
	itemIndex: number,
	method: 'GET' | 'PUT',
	bucket: string,
	filePath: string,
	expirationSeconds: number,
	contentType: string = '',
): Promise<IDataObject> {
	if (!Number.isFinite(expirationSeconds) || expirationSeconds <= 0) {
		throw new NodeOperationError(context.getNode(), 'Expiration (seconds) must be greater than zero.', {
			itemIndex,
		});
	}

	const serviceAccount = await getGcpServiceAccountCredentials(context, itemIndex);
	const expires = Math.floor(Date.now() / 1000) + Math.floor(expirationSeconds);
	const canonicalResource = `/${bucket}/${filePath}`;
	const stringToSign = `${method}\n\n${contentType}\n${expires}\n${canonicalResource}`;
	const signer = createSign('RSA-SHA256');
	signer.update(stringToSign);
	signer.end();
	const signature = signer.sign(serviceAccount.privateKey, 'base64');

	const objectPath = encodeObjectPath(filePath);
	const signedUrl = `https://storage.googleapis.com/${encodeURIComponent(bucket)}/${objectPath}?GoogleAccessId=${encodeURIComponent(serviceAccount.clientEmail)}&Expires=${expires}&Signature=${encodeURIComponent(signature)}`;

	return {
		bucket,
		filePath,
		method,
		expirationSeconds,
		expiresAtUnix: expires,
		signedUrl,
	};
}
