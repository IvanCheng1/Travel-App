import "babel-polyfill";
import { postCity } from '../client/js/app'


test('post picture to geonames and fetch city coordinates', () => {

    expect(typeof postCity()).toBe("object");
});