# mimimo-pet-byte

Byte, a mint robot by Flowscape for Mimimo. Original lightweight SVG frames, no remote requests.

```ts
import { createPet } from 'mimimo';
import { byte } from 'mimimo-pet-byte';

const pet = createPet({ character: byte });
pet.play('happy');
```

Install this pet independently. It does not depend on other pet packages. Requires Mimimo 0.1.x. This workspace is a development preview and is not published.
