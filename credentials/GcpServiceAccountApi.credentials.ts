import type { ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class GcpServiceAccountApi implements ICredentialType {
	name = 'gcpServiceAccountApi';

	displayName = 'GCP Service Account API';

	icon: Icon = {
		light: 'file:GcpServiceAccountApi.svg',
		dark: 'file:GcpServiceAccountApi.dark.svg',
	};

	documentationUrl = 'https://cloud.google.com/storage/docs/authentication';

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://oauth2.googleapis.com',
			url: '/token',
			method: 'POST',
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Client Email',
			name: 'clientEmail',
			type: 'string',
			default: '',
			required: true,
			description: 'Service account client email',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
				rows: 8,
			},
			default: '',
			required: true,
			description: 'Service account private key in PEM format',
		},
	];
}
