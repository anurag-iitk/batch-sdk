import { Interface, keccak256, toUtf8Bytes, Fragment } from "ethers";

export enum FacetCutAction {
  Add = 0,
  Replace = 1,
  Remove = 2,
}

type Contract = {
  interface: Interface;
};

export type SelectorCollection = {
  contract: Contract;
  remove: (functionNames: string[]) => SelectorCollection;
  get: (functionNames: string[]) => SelectorCollection;
} & string[];

// Get function selectors from ABI
export function getSelectors(contract: Contract): SelectorCollection {
  const fragments = Object.values(contract.interface.fragments).filter(
    (fragment) => fragment.type === "function"
  ) as Fragment[];

  const selectors = fragments.reduce<string[]>((acc, fragment) => {
    const selector = keccak256(toUtf8Bytes(fragment.format())).substring(0, 10); // Get 4-byte selector
    acc.push(selector);
    return acc;
  }, []);

  type SelectorContext = SelectorCollection;

  const remove = function (
    this: SelectorContext,
    functionNames: string[]
  ): SelectorCollection {
    const updatedSelectors = this.filter((v: string) => {
      for (const functionName of functionNames) {
        const fragment = contract.interface.getFunction(functionName);
        if (fragment) {
          const selector = keccak256(toUtf8Bytes(fragment.format())).substring(0, 10);
          if (v === selector) {
            return false;
          }
        }
      }
      return true;
    }) as SelectorCollection;
    return Object.assign(updatedSelectors, {
      contract: this.contract,
      remove: this.remove,
      get: this.get,
    });
  };

  const get = function (
    this: SelectorContext,
    functionNames: string[]
  ): SelectorCollection {
    const filteredSelectors = this.filter((v: string) => {
      for (const functionName of functionNames) {
        const fragment = contract.interface.getFunction(functionName);
        if (fragment) {
          const selector = keccak256(toUtf8Bytes(fragment.format())).substring(0, 10);
          if (v === selector) {
            return true;
          }
        }
      }
      return false;
    }) as SelectorCollection;
    return Object.assign(filteredSelectors, {
      contract: this.contract,
      remove: this.remove,
      get: this.get,
    });
  };

  return Object.assign(selectors, { contract, remove, get });
}

// Get function selector from function signature
export function getSelector(func: string): string {
  const abiInterface = new Interface([func]);
  const fragment = Fragment.from(func);

  if (!fragment) {
    throw new Error(`Invalid function signature: ${func}`);
  }

  return keccak256(toUtf8Bytes(fragment.format())).substring(0, 10);
}

// Remove selectors from an array of selectors using an array of function signatures
export function removeSelectors(
  selectors: string[],
  signatures: string[]
): string[] {
  const iface = new Interface(signatures.map((v) => `function ${v}`));
  const removeSelectors = signatures
    .map((v) => {
      const fragment = iface.getFunction(v);
      if (!fragment) {
        throw new Error(`Invalid function signature: ${v}`);
      }
      return keccak256(toUtf8Bytes(fragment.format())).substring(0, 10);
    })
    .filter(Boolean);

  return selectors.filter((selector) => !removeSelectors.includes(selector));
}

// Find the position of a particular address in the facets array
export function findAddressPositionInFacets(
  facetAddress: string,
  facets: { facetAddress: string }[]
): number | null {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
  return null;
}
