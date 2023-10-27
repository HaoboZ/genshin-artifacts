import assert from 'assert';
import { describe, it } from 'node:test';
import pget from './pget';

describe('pget', () => {
	it('string', () => {
		assert.strictEqual(pget({ a: 1 }, 'a'), 1);
	});
	it('array', () => {
		assert.strictEqual(pget({ a: 1 }, ['a']), 1);
	});
	it('array nested', () => {
		assert.strictEqual(pget({ a: { b: 1 } }, ['a', 'b']), 1);
	});
	it('dot nested', () => {
		assert.strictEqual(pget({ a: { b: 1 } }, 'a.b'), 1);
	});
	it('null', () => {
		assert.strictEqual(pget({ a: { b: null } }, ['a', 'b']), null);
	});
	it('dot array', () => {
		assert.strictEqual(pget({ a: [1, 2] }, 'a.1'), 2);
	});
	it('data-last', () => {
		assert.strictEqual(pget('a')({ a: 1 }), 1);
	});
	it('data-last array', () => {
		assert.strictEqual(pget('a.b')({ a: { b: 1 } }), 1);
	});
	it('default', () => {
		assert.strictEqual(pget({ a: { b: 1 } }, 'a.b.c', 5), 5);
	});
	it('data-last default', () => {
		assert.strictEqual(pget('a.b.c', 5)({ a: { b: 1 } }), 5);
	});
});
