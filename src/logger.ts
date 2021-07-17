import { blueBright as blue } from 'chalk';

export function info(message: string): void {
	console.log(`${blue('[info]')} ${message}`);
}
