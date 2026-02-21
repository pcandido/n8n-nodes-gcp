import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getGoogleServiceAccountAccessToken } from '../../shared/googleServiceAccount';

export const uploadOperation: INodePropertyOptions = {
	name: 'Upload',
	value: 'upload',
	description: 'Upload a binary file as a GCS object',
	action: 'Upload an object',
};

const uploadBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'object_upload_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			entity: ['object'],
			operation: ['upload'],
		},
	},
	description: 'Name of the GCS bucket',
};

const uploadFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'object_upload_file_path',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			entity: ['object'],
			operation: ['upload'],
		},
	},
	description: 'Path of the object inside the bucket',
};

const uploadBinaryProperty: INodeProperties = {
	displayName: 'Binary Property',
	name: 'object_upload_binary_property',
	type: 'string',
	default: 'data',
	required: true,
	displayOptions: {
		show: {
			entity: ['object'],
			operation: ['upload'],
		},
	},
	description: 'Binary property that contains the file content',
};

export const uploadProperties: INodeProperties[] = [
	uploadBucketProperty,
	uploadFilePathProperty,
	uploadBinaryProperty,
];

export async function executeUpload(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<Record<string, unknown>> {
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

	let uploadedObject: Record<string, unknown>;
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
		})) as Record<string, unknown>;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `GCS upload request failed: ${String(error)}`, {
			itemIndex,
		});
	}

	const encodedPath = filePath
		.split('/')
		.filter((part) => part.length > 0)
		.map((part) => encodeURIComponent(part))
		.join('/');
	const objectUrl = `https://storage.googleapis.com/${encodeURIComponent(bucket)}/${encodedPath}`;
	const gsUrl = `gs://${bucket}/${filePath}`;
	const mediaLink =
		typeof uploadedObject.mediaLink === 'string' ? uploadedObject.mediaLink : undefined;
	const selfLink = typeof uploadedObject.selfLink === 'string' ? uploadedObject.selfLink : undefined;

	return {
		bucket,
		filePath,
		objectUrl,
		gsUrl,
		mediaLink,
		selfLink,
		binaryProperty,
		fileName: binaryData.fileName,
		mimeType,
		fileSize: binaryData.fileSize,
		uploadedObject,
	};
}
