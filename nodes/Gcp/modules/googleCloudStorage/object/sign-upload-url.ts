import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { createV2SignedUrl } from '../../../../shared/signed-url';

export const googleCloudStorageObjectSignUploadUrlOption: INodePropertyOptions = {
	name: 'Sign Upload URL',
	value: 'signUploadUrl',
	description: 'Create a signed URL for upload',
	action: 'Create a signed upload URL',
};

const signUploadBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_signUploadUrl_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['signUploadUrl'] } },
};

const signUploadFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_signUploadUrl_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['signUploadUrl'] } },
};

const signUploadExpirationProperty: INodeProperties = {
	displayName: 'Expiration (Seconds)',
	name: 'googleCloudStorage_object_signUploadUrl_expirationSeconds',
	type: 'number',
	default: 3600,
	typeOptions: { minValue: 1 },
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['signUploadUrl'] } },
};

const signUploadContentTypeProperty: INodeProperties = {
	displayName: 'Content Type',
	name: 'googleCloudStorage_object_signUploadUrl_contentType',
	type: 'string',
	default: '',
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['signUploadUrl'] } },
	description: 'Optional content type restriction for the signed upload URL',
};

export const googleCloudStorageObjectSignUploadUrlProperties: INodeProperties[] = [
	signUploadBucketProperty,
	signUploadFilePathProperty,
	signUploadExpirationProperty,
	signUploadContentTypeProperty,
];

export async function executeGoogleCloudStorageObjectSignUploadUrl(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(signUploadBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(signUploadFilePathProperty.name, itemIndex) as string;
	const expirationSeconds = context.getNodeParameter(signUploadExpirationProperty.name, itemIndex) as number;
	const contentType = context.getNodeParameter(signUploadContentTypeProperty.name, itemIndex) as string;
	const json = await createV2SignedUrl(
		context,
		itemIndex,
		'PUT',
		bucket,
		filePath,
		expirationSeconds,
		contentType,
	);

	return { json };
}
