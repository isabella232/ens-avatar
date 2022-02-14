import { Contract } from '@ethersproject/contracts';
import { fetch, resolveURI } from '../utils';

const abi = [
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
];

export default class ERC721 {
  async getMetadata(
    provider: any,
    registrarAddress: string,
    contractAddress: string,
    tokenID: string
  ) {
    const contract = new Contract(contractAddress, abi, provider);
    const [tokenURI, owner] = await Promise.all([
      contract.tokenURI(tokenID),
      registrarAddress && contract.ownerOf(tokenID),
    ]);
    if (owner.toLowerCase() !== registrarAddress.toLowerCase()) return null;

    const { uri: resolvedURI, isOnChain, isEncoded } = resolveURI(tokenURI);
    let _resolvedUri = resolvedURI;
    if (isOnChain) {
      if (isEncoded) {
        _resolvedUri = Buffer.from(
          resolvedURI.replace('data:application/json;base64,', ''),
          'base64'
        ).toString();
      }
      return JSON.parse(_resolvedUri);
    }
    const response = await fetch(resolvedURI.replace(/(?:0x)?{id}/, tokenID));
    return await response?.data;
  }
}
