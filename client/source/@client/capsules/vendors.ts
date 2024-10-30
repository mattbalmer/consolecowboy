import { Capsule } from '@yootil/capsule';
import { Vendor } from '@shared/types/game';
import { Vendors } from '@shared/constants/vendors';

class VendorsCapsule extends Capsule<
  Record<keyof typeof Vendors, Vendor>
>{
  getAll() {
    // @ts-ignore
    const keys: Set<keyof typeof this.typeref> = super.keys;
    return Array.from(keys).reduce((result, key) => {
      result[key] = this.get(key);
      return result;
    }, {} as typeof this.typeref);
  }

  resetAll() {
    // @ts-ignore
    const keys: Set<keyof typeof this.typeref> = super.keys;
    Array.from(keys).forEach(key => {
      this.set(key, Vendors[key]());
    });
  }
}

export const getVendorsInitial = () => {
  return Object.keys(Vendors).reduce((result, key) => {
    result[key] = Vendors[key]();
    return result;
  }, {} as Record<keyof typeof Vendors, Vendor>);
}

export const vendorsCapsule = new VendorsCapsule('consolecowboy-vendors', getVendorsInitial());