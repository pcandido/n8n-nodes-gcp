import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { getGoogleServiceAccountAccessToken } from '../../../../shared/get-access-token';

export const googleCloudStorageObjectUploadOption: INodePropertyOptions = {
	name: 'Upload',
	value: 'upload',
	description: 'Upload a binary file as a GCS object',
	action: 'Upload an object',
};

const uploadBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_upload_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			gcpModule: ['googleCloudStorage'],
			googleCloudStorageEntity: ['object'],
			googleCloudStorageObjectOperation: ['upload'],
		},
	},
	description: 'Name of the GCS bucket',
};

const uploadFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_upload_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			gcpModule: ['googleCloudStorage'],
			googleCloudStorageEntity: ['object'],
			googleCloudStorageObjectOperation: ['upload'],
		},
	},
	description: 'Path of the object inside the bucket',
};

const uploadBinaryProperty: INodeProperties = {
	displayName: 'Binary Property',
	name: 'googleCloudStorage_object_upload_binaryProperty',
	type: 'string',
	default: 'data',
	required: true,
	displayOptions: {
		show: {
			gcpModule: ['googleCloudStorage'],
			googleCloudStorageEntity: ['object'],
			googleCloudStorageObjectOperation: ['upload'],
		},
	},
	description: 'Binary property that contains the file content',
};

export const googleCloudStorageObjectUploadProperties: INodeProperties[] = [
	uploadBucketProperty,
	uploadFilePathProperty,
	uploadBinaryProperty,
];

export async function executeGoogleCloudStorageObjectUpload(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(uploadBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(uploadFilePathProperty.name, itemIndex) as string;
	const binaryProperty = context.getNodeParameter(uploadBinaryProperty.name, itemIndex) as string;
	const binaryData = items[itemIndex]?.binary?.[binaryProperty];

	if (!binaryData) {
		throw new NodeOperationError(
			context.getNode(),
			`Binary property "${binaryProperty}" was not found in item ${itemIndex}.`,
			{ itemIndex },
		);
	}

	const fileBuffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryProperty);
	const mimeType = binaryData.mimeType || 'application/octet-stream';
	const accessToken = await getGoogleServiceAccountAccessToken(
		context,
		itemIndex,
		'https://www.googleapis.com/auth/devstorage.read_write',
	);

	let uploadedObject: IDataObject;
	try {
		uploadedObject = (await context.helpers.httpRequest({
			method: 'POST',
			url: `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o`,
			qs: {
				uploadType: 'media',
				name: filePath,
			},
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': mimeType,
			},
			body: fileBuffer,
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`GCS upload request failed: ${String(error)}`,
			{ itemIndex },
		);
	}

	return { json: uploadedObject, binary: items[itemIndex]?.binary };
}
