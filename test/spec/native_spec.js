import { setNativeTargeting } from 'src/native';

describe('native.js', () => {
  it('builds click url', () => {
    const bid = {
      native: {
        clickUrl: 'https://www.link.example',
        clickTrackers: ['https://tracker.example']
      }
    };

    const targeting = setNativeTargeting(bid);
    const decodedUrl = decodeURIComponent(targeting.hb_native_linkurl);

    expect(decodedUrl).equal(
      'https://www.link.example?https://tracker.example'
    );
  });
});
