import { faker } from '@faker-js/faker';
import { writeFile } from 'fs';
import { join } from 'path';

let content = 'name|email|birthdate';

for (let i = 0; i < 50; i++) {
  const name = faker.person.fullName();
  const email = faker.internet.email();
  const birthdate = faker.date.birthdate();
  content = `${content}\n${name}|${email}|${birthdate}`;
}
writeFile(join(__dirname, 'data1.csv'), content, (err) => {
  if (err) {
    console.error(err);
  }
  console.log('Done!');
})
