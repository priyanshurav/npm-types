import { spawn } from 'child_process';
import fetch from 'node-fetch';
import validate from 'validate-npm-package-name';
import { info } from './logger';
import { PackagesToBeInstalled } from './types';

/* istanbul ignore next */
export function runNpm(cmd: string, cwd = process.cwd()) {
	return new Promise<Error | string>((resolve, reject) => {
		const cmds = cmd.split(' ');
		const proc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', cmds, {
			cwd,
		});
		proc.on('exit', () => {
			resolve(proc.stdout.read()?.toString?.('utf8'));
		});
		proc.on('error', (e) => {
			reject(e);
		});
	});
}

export async function queryPackageInfo(
	pkg: string
): Promise<Record<string, any>> {
	const REQUEST_URL = `https://registry.npmjs.org/${pkg}`;

	const res = await fetch(REQUEST_URL);
	if (!res.ok) {
		throw new Error(
			`request to url '${REQUEST_URL}' failed with error code ${res.status}`
		);
	}
	const json = await res.json();
	return json;
}

export function validatePackageName(pkg: string): boolean {
	const res = validate(pkg);

	return res.validForNewPackages && res.validForOldPackages;
}

export async function getPkgsToBeInstalled(
	pkgs: string[],
	installDeprecatedTypes?: boolean
): Promise<PackagesToBeInstalled> {
	pkgs = [...new Set(pkgs)];

	const deps: PackagesToBeInstalled = {
		devDeps: [],
		prodDeps: [],
	};

	for (const pkg of pkgs) {
		try {
			if (!validatePackageName(pkg)) {
				info(`'${pkg}' was skipped because the package name is invalid`);
				break;
			}

			const pkgInfo = await queryPackageInfo(pkg);

			deps.prodDeps.push(pkg);

			const last = function <T>(arr: T[]): T {
				return arr[arr.length - 1];
			};

			if (pkgInfo.versions[last(Object.keys(pkgInfo.versions))]?.types) {
				info(
					`'${pkg}' has its built-in types, skipping its installation of types`
				);
				break;
			}

			const pkgTypesInfo = await queryPackageInfo(`@types/${pkg}`);

			if (
				pkgTypesInfo.versions[last(Object.keys(pkgTypesInfo.versions))]
					?.deprecated &&
				!installDeprecatedTypes
			) {
				info(`'@types/${pkg}' is deprecated, skipping its installation`);
				break;
			}

			deps.devDeps.push(`@types/${pkg}`);
		} catch (e) {}
	}

	return deps;
}
