import { expect } from 'chai';
import {
	getPkgsToBeInstalled,
	queryPackageInfo,
	validatePackageName,
} from '../src/utils';

describe('Test utils', () => {
	describe('#getPkgsToBeInstalled()', () => {
		it('should get correct packages to be installed', async () => {
			const result = await getPkgsToBeInstalled(['mocha']);
			const result2 = await getPkgsToBeInstalled(['get-text-indices']);
			const result3 = await getPkgsToBeInstalled(['get-text-indic:es']);
			const result4 = await getPkgsToBeInstalled(['chalk']);
			const result5 = await getPkgsToBeInstalled(['jkahkjdf']);

			expect(result).to.deep.equal({
				devDeps: ['@types/mocha'],
				prodDeps: ['mocha'],
			});
			expect(result2).to.deep.equal({
				devDeps: [],
				prodDeps: ['get-text-indices'],
			});
			expect(result3).to.deep.equal({
				devDeps: [],
				prodDeps: [],
			});
			expect(result4).to.deep.equal({
				devDeps: [],
				prodDeps: ['chalk'],
			});
			expect(result5).to.deep.equal({
				devDeps: [],
				prodDeps: [],
			});
		});
	});

	describe('#queryPackageInfo()', async () => {
		it('should query package info without errors', async () => {
			const result = await queryPackageInfo('get-text-indices');
			expect(typeof result).to.equal('object');
		});
	});

	describe('#validatePackageName()', () => {
		const result = validatePackageName('jhdkhfk:%$khas');

		expect(result).to.be.false;
	});
});
