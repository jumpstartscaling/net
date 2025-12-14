import { createDirectus, rest, authentication, readFields } from '@directus/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../credentials.env') });

const client = createDirectus(process.env.DIRECTUS_PUBLIC_URL!).with(authentication()).with(rest());

async function inspect() {
    await client.login(process.env.DIRECTUS_ADMIN_EMAIL!, process.env.DIRECTUS_ADMIN_PASSWORD!);
    // @ts-ignore
    const fields = await client.request(readFields('pages'));
    const blocksField = fields.find((f: any) => f.field === 'blocks');
    console.log('Blocks Field:', blocksField);
}
inspect();
