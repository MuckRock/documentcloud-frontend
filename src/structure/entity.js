import { Svue } from 'svue';

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


export class Entities extends Svue {
  constructor(rawEntities, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.rawEntities = rawEntities;
        return data;
      },
      computed: {
        ...computed,
        count(rawEntities) {
          return rawEntities.count;
        },
        next(rawEntities) {
          return rawEntities.next;
        },
        hasNext(next) {
          return next != null;
        },
        entities(rawEntities) {
          return rawEntities.results.map(x => new Entity(x));
        }
      }
    });
  }
}
