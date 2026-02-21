import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import {
	executeGoogleCloudStorageBucketCreate,
	googleCloudStorageBucketCreateOption,
	googleCloudStorageBucketCreateProperties,
} from './create';
import {
	executeGoogleCloudStorageBucketDelete,
	googleCloudStorageBucketDeleteOption,
	googleCloudStorageBucketDeleteProperties,
} from './delete';
import {
	executeGoogleCloudStorageBucketGetMetadata,
	googleCloudStorageBucketGetMetadataOption,
	googleCloudStorageBucketGetMetadataProperties,
} from './get-metadata';
import {
	executeGoogleCloudStorageBucketList,
	googleCloudStorageBucketListOption,
	googleCloudStorageBucketListProperties,
} from './list';
import {
	executeGoogleCloudStorageBucketSetMetadata,
	googleCloudStorageBucketSetMetadataOption,
	googleCloudStorageBucketSetMetadataProperties,
} from './set-metadata';

export const googleCloudStorageBucketOption: INodePropertyOptions = {
	name: 'Google Cloud Storage - Bucket',
	value: 'googleCloudStorageBucket',
};

export const googleCloudStorageBucketEntityOption: INodePropertyOptions = {
	name: 'Bucket',
	value: 'bucket',
};

const googleCloudStorageBucketOperationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'createBucket',
	displayOptions: {
		show: {
			resource: ['googleCloudStorageBucket'],
		},
	},
	options: [
		googleCloudStorageBucketCreateOption,
		googleCloudStorageBucketDeleteOption,
		googleCloudStorageBucketGetMetadataOption,
		googleCloudStorageBucketSetMetadataOption,
		googleCloudStorageBucketListOption,
	],
};

export const googleCloudStorageBucketProperties: INodeProperties[] = [
	googleCloudStorageBucketOperationProperty,
	...googleCloudStorageBucketCreateProperties,
	...googleCloudStorageBucketDeleteProperties,
	...googleCloudStorageBucketGetMetadataProperties,
	...googleCloudStorageBucketSetMetadataProperties,
	...googleCloudStorageBucketListProperties,
];

export async function executeGoogleCloudStorageBucket(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<IOperationResult> {
	const operation = context.getNodeParameter(googleCloudStorageBucketOperationProperty.name, itemIndex) as string;

	switch (operation) {
		case 'createBucket':
			return await executeGoogleCloudStorageBucketCreate(context, itemIndex);
		case 'deleteBucket':
			return await executeGoogleCloudStorageBucketDelete(context, itemIndex);
		case 'getBucketMetadata':
			return await executeGoogleCloudStorageBucketGetMetadata(context, itemIndex);
		case 'setBucketMetadata':
			return await executeGoogleCloudStorageBucketSetMetadata(context, itemIndex);
		case 'listBuckets':
			return await executeGoogleCloudStorageBucketList(context, itemIndex);
		default:
			throw new NodeOperationError(context.getNode(), `Unsupported bucket operation: ${operation}`, {
				itemIndex,
			});
	}
}
