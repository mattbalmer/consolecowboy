import { Capsule } from '@yootil/capsule';
import { Vendor } from '@shared/types/game';
import { VendorID, Vendors } from '@shared/constants/vendors';

class VendorsCapsule extends Capsule<
  Record<VendorID, Vendor>
>{
  getVendor(vendorID: VendorID): Vendor {
    return {
      ...this.get(vendorID),
      canVisit: Vendors[vendorID]().canVisit,
    };
  }

  setVendor(vendor: Vendor) {
    const { canVisit, ...rest } = vendor;
    this.set(vendor.id as VendorID, rest);
  }

  getAll() {
    // @ts-ignore
    const keys: Set<keyof typeof this.typeref> = super.keys;
    return Array.from(keys).reduce((result, key) => {
      result[key] = this.getVendor(key);
      return result;
    }, {} as typeof this.typeref);
  }

  resetAll() {
    // @ts-ignore
    const keys: Set<keyof typeof this.typeref> = super.keys;
    Array.from(keys).forEach(key => {
      this.setVendor(Vendors[key]());
    });
  }
}

const getVendorsInitial = () => {
  return Object.keys(Vendors).reduce((result, key) => {
    const { canVisit, ...vendor } = Vendors[key]();
    result[vendor.id as VendorID] = vendor;
    return result;
  }, {} as Record<VendorID, Vendor>);
}

export const vendorsCapsule = new VendorsCapsule('consolecowboy-vendors', getVendorsInitial());