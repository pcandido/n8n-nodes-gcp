import type { ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class GcpServiceAccountApi implements ICredentialType {
	name = 'gcpServiceAccountApi';

	displayName = 'GCP Service Account API';

	icon: Icon = {
		light: 'file:GcpServiceAccountApi.svg',
		dark: 'file:GcpServiceAccountApi.dark.svg',
	};

	documentationUrl = 'https://docs.cloud.google.com/iam/docs/service-account-overview';

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.googleapis.com',
			url: '/discovery/v1/apis',
			method: 'GET',
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
