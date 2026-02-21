import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken, readErrorStatusCode } from './common';

export const googleCloudStorageObjectExistsOption: INodePropertyOptions = {
	name: 'Exists',
	value: 'exists',
	description: 'Check if an object exists',
	action: 'Check object existence',
};

const existsBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_exists_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['exists'] } },
};

const existsFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_exists_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['exists'] } },
};

export const googleCloudStorageObjectExistsProperties: INodeProperties[] = [existsBucketProperty, existsFilePathProperty];

export async function executeGoogleCloudStorageObjectExists(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(existsBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(existsFilePathProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	try {
		await context.helpers.httpRequest({
			method: 'GET',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(filePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		});
		return { json: { bucket, filePath, exists: true } };
	} catch (error) {
		if (readErrorStatusCode(error) === 404) return { json: { bucket, filePath, exists: false } };
		throw new NodeOperationError(context.getNode(), `Failed to check object existence: ${String(error)}`, { itemIndex });
	}
}
