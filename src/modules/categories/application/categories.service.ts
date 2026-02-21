import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly store: StoreService) {}

  create(input: { name: string; slug: string; description?: string }) {
    const category = { id: this.store.id(), ...input };
    this.store.categories.push(category);
    return category;
  }

  list() {
    return this.store.categories;
  }

  update(id: string, input: { name?: string; slug?: string; description?: string }) {
    const category = this.store.categories.find((c) => c.id === id);
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, input);
    return category;
  }

  remove(id: string) {
    this.store.categories = this.store.categories.filter((c) => c.id !== id);
    return { success: true };
  }
}
