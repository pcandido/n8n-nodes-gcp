import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken, readErrorStatusCode } from './common';

export const googleCloudStorageObjectChangeVisibilityOption: INodePropertyOptions = {
	name: 'Change Visibility',
	value: 'changeVisibility',
	description: 'Set object visibility to public or private',
	action: 'Change object visibility',
};

const visibilityBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_changeVisibility_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['changeVisibility'] } },
};

const visibilityFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_changeVisibility_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['changeVisibility'] } },
};

const visibilityValueProperty: INodeProperties = {
	displayName: 'Visibility',
	name: 'googleCloudStorage_object_changeVisibility_value',
	type: 'options',
	default: 'private',
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['changeVisibility'] } },
	options: [
		{ name: 'Private', value: 'private' },
		{ name: 'Public', value: 'public' },
	],
};

export const googleCloudStorageObjectChangeVisibilityProperties: INodeProperties[] = [
	visibilityBucketProperty,
	visibilityFilePathProperty,
	visibilityValueProperty,
];

export async function executeGoogleCloudStorageObjectChangeVisibility(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(visibilityBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(visibilityFilePathProperty.name, itemIndex) as string;
	const visibility = context.getNodeParameter(visibilityValueProperty.name, itemIndex) as 'public' | 'private';
	const accessToken = await getGcsAccessToken(context, itemIndex);
	const objectName = encodeObjectName(filePath);

	try {
		switch (visibility) {
			case 'public':
				await context.helpers.httpRequest({
					method: 'POST',
					url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${objectName}/acl`,
					headers: { Authorization: `Bearer ${accessToken}` },
					body: { entity: 'allUsers', role: 'READER' },
					json: true,
				});
				break;
			case 'private':
				try {
					await context.helpers.httpRequest({
						method: 'DELETE',
						url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${objectName}/acl/allUsers`,
						headers: { Authorization: `Bearer ${accessToken}` },
						json: true,
					});
				} catch (error) {
					if (readErrorStatusCode(error) !== 404) throw error;
				}
				break;
			default:
				throw new NodeOperationError(context.getNode(), `Unsupported visibility: ${visibility}`, {
					itemIndex,
				});
		}
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to change visibility: ${String(error)}`, {
			itemIndex,
		});
	}

	return { json: { bucket, filePath, visibility } };
}
