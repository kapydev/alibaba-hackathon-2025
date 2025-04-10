import { create } from 'zustand';

type assetHash = string;
type assetURL = string;

const initialState = {
  assetMap: {} as Record<assetHash, assetURL>,
};

export type AssetStore = typeof initialState;

export const assetStore = create<AssetStore>((set, get) => initialState);

export async function handleSaveImagesDict(data: Record<string, string>) {
  assetStore.setState({ assetMap: data });
}
