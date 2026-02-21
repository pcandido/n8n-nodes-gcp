import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken } from './common';

export const googleCloudStorageObjectDeleteOption: INodePropertyOptions = {
	name: 'Delete',
	value: 'delete',
	description: 'Delete an object',
	action: 'Delete an object',
};

const deleteBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_delete_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['delete'] } },
};

const deleteFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_delete_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['delete'] } },
};

export const googleCloudStorageObjectDeleteProperties: INodeProperties[] = [deleteBucketProperty, deleteFilePathProperty];

export async function executeGoogleCloudStorageObjectDelete(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(deleteBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(deleteFilePathProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	try {
		await context.helpers.httpRequest({
			method: 'DELETE',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(filePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		});
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to delete object: ${String(error)}`, { itemIndex });
	}

	return { json: { bucket, filePath, deleted: true } };
}
