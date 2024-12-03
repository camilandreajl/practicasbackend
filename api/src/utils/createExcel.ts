import ExcelJs from 'exceljs';
import Stream from 'stream';
import { getObjectInBucket, uploadFileToBucket } from './signedUrl';

export interface ExcelData {
  headers: {
    key: string;
    title: string;
  }[];
  data:
    | {
        [key: string]: string | number | boolean | Date;
      }[]
    | string;
  path: string;
}

const createExcel = async (excelData: ExcelData) => {
  try {
    const { headers, path } = excelData;

    const data: { [key: string]: string | number | boolean | Date }[] =
      typeof excelData.data === 'string'
        ? JSON.parse(excelData.data)
        : excelData.data;

    const stream = new Stream.PassThrough();
    const workbook = new ExcelJs.stream.xlsx.WorkbookWriter({
      stream: stream,
    });

    const name = path.split('/').pop();
    const worksheet = workbook.addWorksheet(name);

    worksheet.columns = headers.map((header) => ({
      header: header.title,
      key: header.key,
    }));
    data.forEach((row: any) => {
      worksheet.addRow(row).commit();
    });

    // Commit all changes
    worksheet.commit();
    await workbook.commit();

    // Convertir el stream a buffer
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });

    // Ahora subimos el buffer en lugar del stream
    await uploadFileToBucket(path, buffer, false);

    const signedUrl = await getObjectInBucket(path, false);

    return {
      url: signedUrl,
      message: 'URL for file upload generated successfully',
      error: false,
    };
  } catch (error) {
    return {
      url: '',
      message: JSON.stringify(error),
      error: true,
    };
  }
};

export { createExcel };
