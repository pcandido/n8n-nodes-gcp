import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { getGcsAccessToken } from './common';

export const googleCloudStorageBucketCreateOption: INodePropertyOptions = {
	name: 'Create Bucket',
	value: 'createBucket',
	description: 'Create a new bucket',
	action: 'Create bucket',
};

const createProjectIdProperty: INodeProperties = {
	displayName: 'Project ID',
	name: 'googleCloudStorage_bucket_create_projectId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['createBucket'] },
	},
};

const createBucketNameProperty: INodeProperties = {
	displayName: 'Bucket Name',
	name: 'googleCloudStorage_bucket_create_name',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['createBucket'] },
	},
};

const createLocationProperty: INodeProperties = {
	displayName: 'Location',
	name: 'googleCloudStorage_bucket_create_location',
	type: 'string',
	default: 'US',
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['createBucket'] },
	},
};

const createStorageClassProperty: INodeProperties = {
	displayName: 'Storage Class',
	name: 'googleCloudStorage_bucket_create_storageClass',
	type: 'options',
	default: 'STANDARD',
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['createBucket'] },
	},
	options: [
		{ name: 'Standard', value: 'STANDARD' },
		{ name: 'Nearline', value: 'NEARLINE' },
		{ name: 'Coldline', value: 'COLDLINE' },
		{ name: 'Archive', value: 'ARCHIVE' },
	],
};

export const googleCloudStorageBucketCreateProperties: INodeProperties[] = [
	createProjectIdProperty,
	createBucketNameProperty,
	createLocationProperty,
	createStorageClassProperty,
];

export async function executeGoogleCloudStorageBucketCreate(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const projectId = context.getNodeParameter(createProjectIdProperty.name, itemIndex) as string;
	const bucketName = context.getNodeParameter(createBucketNameProperty.name, itemIndex) as string;
	const location = context.getNodeParameter(createLocationProperty.name, itemIndex) as string;
	const storageClass = context.getNodeParameter(createStorageClassProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let bucket: IDataObject;
	try {
		bucket = (await context.helpers.httpRequest({
			method: 'POST',
			url: 'https://storage.googleapis.com/storage/v1/b',
			headers: { Authorization: `Bearer ${accessToken}` },
			qs: { project: projectId },
			body: { name: bucketName, location, storageClass },
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to create bucket: ${String(error)}`, { itemIndex });
	}

	return { json: bucket };
}
