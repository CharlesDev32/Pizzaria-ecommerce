import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class AddressesService {
  constructor(private readonly store: StoreService) {}

  listByUser(userId: string) {
    return this.store.customerAddresses.filter((address) => address.userId === userId);
  }

  create(
    userId: string,
    input: {
      label: string;
      street: string;
      number: string;
      complement?: string;
      neighborhoodId: string;
      reference?: string;
      isDefault?: boolean;
    },
  ) {
    if (input.isDefault) {
      this.unsetDefault(userId);
    }

    const address = {
      id: this.store.id(),
      userId,
      label: input.label,
      street: input.street,
      number: input.number,
      complement: input.complement,
      neighborhoodId: input.neighborhoodId,
      reference: input.reference,
      isDefault: input.isDefault ?? this.listByUser(userId).length === 0,
    };

    this.store.customerAddresses.push(address);
    return address;
  }

  update(
    userId: string,
    addressId: string,
    input: Partial<{
      label: string;
      street: string;
      number: string;
      complement?: string;
      neighborhoodId: string;
      reference?: string;
      isDefault: boolean;
    }>,
  ) {
    const address = this.store.customerAddresses.find((item) => item.id === addressId && item.userId === userId);
    if (!address) throw new NotFoundException('Address not found');
    if (input.isDefault) {
      this.unsetDefault(userId);
    }
    Object.assign(address, input);
    return address;
  }

  byIdForUser(userId: string, addressId: string) {
    const address = this.store.customerAddresses.find((item) => item.id === addressId && item.userId === userId);
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  private unsetDefault(userId: string) {
    this.store.customerAddresses.forEach((address) => {
      if (address.userId === userId) address.isDefault = false;
    });
  }
}

