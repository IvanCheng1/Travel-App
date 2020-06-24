import "babel-polyfill";
import { postCity, postWeather, postPicture } from '../client/js/app'

test('post city to geonames and fetch city coordinates', () => {


    expect(postCity()).toBe(true);
    // expect(true).toBe(true);
});