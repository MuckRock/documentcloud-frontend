import { Svue } from 'svue';
import { Results } from './results';

export class Entity extends Svue {
  constructor(rawEntity, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.rawEntity = rawEntity;
        return data;
      },
      computed: {
        ...computed,
        entity(rawEntity) {
          return rawEntity.entity;
        },
        name(entity) {
          return entity.name;
        },
        kind(entity) {
          return entity.kind;
        },
        description(entity) {
          return entity.description;
        },
        mid(entity) {
          return entity.mid;
        },
        wikiUrl(entity) {
          return entity.wikipedia_url;
        },
        occurrences(rawEntity) {
          return rawEntity.occurences;
        },
        numOccurrences(occurrences) {
          return occurrences.length;
        }
      }
    });
  }
}


export class Entities extends Results {
  constructor(url, rawEntities) {
    super(url, rawEntities, {
      computed: {
        entities(results) {
          return results.map(x => new Entity(x));
        },
      }
    });
  }
}
