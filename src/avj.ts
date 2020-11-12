import rrdir from 'rrdir';
import path from 'path';
import fs from 'fs';
import AvjItem from './types/avj-item';

async function validateAndFormat(path: string): Promise<AvjItem> {
	return new Promise<AvjItem>((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) {
				reject({
					err,
					path
				});
			} else {
				const content = data.toString();
				try {
					const v = JSON.parse(content);
					if (typeof v === 'object' && v) {
						const f = JSON.stringify(v, null, 2);
						fs.writeFile(path, f, err => {
							if (err) {
								reject({
									err,
									path
								});
							} else {
								const r: AvjItem = {
									path,
									formatted: true
								};
								resolve(r);
							}
						});
					}
				} catch (error: SyntaxError | any) {
					reject({
						err: error,
						path
					});
				}
			}
		});
	});
}

export default async function avx(fileExtension: string[], ignoreFiles: string[], ignoreDirectories: string[], readPath: string): Promise<AvjItem[]> {
	return new Promise((resolve, reject) => {
		readPath = path.normalize(readPath);

		if (!fs.existsSync(readPath)) {
			reject({
				err: new Error(`the path: ${readPath} was not existed`),
				path: readPath
			});
			return;
		}

		let actualPath = rrdir.sync(readPath, {
			exclude: [...ignoreDirectories, ...ignoreFiles],
			strict: true
		});

		fileExtension = fileExtension.map(i => i.startsWith('.') ? i : `.${i}`);

		actualPath = actualPath.filter(i => !i.directory && fileExtension.includes(path.extname(i.path)));

		const ais = actualPath.map(async i => validateAndFormat(i.path));
		resolve(Promise.all(ais.map(async i => i.catch(error => error))));
	});
}
