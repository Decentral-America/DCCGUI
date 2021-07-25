import { Adapter } from '@decentralchain/signature-adapter';
import { seedUtils } from '@decentralchain/waves-transactions';

Adapter.initOptions({ networkCode: (window as any).WavesApp.network.code.charCodeAt(0) });
export const Seed = seedUtils.Seed;
