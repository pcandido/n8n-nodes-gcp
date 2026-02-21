import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { createV2SignedUrl } from '../../../shared/signed-url';

export const googleCloudStorageObjectSignDownloadUrlOption: INodePropertyOptions = {
	name: 'Sign Download URL',
	value: 'signDownloadUrl',
	description: 'Create a signed URL for download',
	action: 'Create a signed download URL',
};

const signDownloadBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_signDownloadUrl_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['signDownloadUrl'] } },
};

const signDownloadFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_signDownloadUrl_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['signDownloadUrl'] } },
};

const signDownloadExpirationProperty: INodeProperties = {
	displayName: 'Expiration (Seconds)',
	name: 'googleCloudStorage_object_signDownloadUrl_expirationSeconds',
	type: 'number',
	default: 3600,
	typeOptions: { minValue: 1 },
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['signDownloadUrl'] } },
};

export const googleCloudStorageObjectSignDownloadUrlProperties: INodeProperties[] = [
	signDownloadBucketProperty,
	signDownloadFilePathProperty,
	signDownloadExpirationProperty,
];

export async function executeGoogleCloudStorageObjectSignDownloadUrl(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(signDownloadBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(signDownloadFilePathProperty.name, itemIndex) as string;
	const expirationSeconds = context.getNodeParameter(signDownloadExpirationProperty.name, itemIndex) as number;
	const json = await createV2SignedUrl(context, itemIndex, 'GET', bucket, filePath, expirationSeconds);

	return { json };
}
