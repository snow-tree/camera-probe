import { generateGuid } from './guid'

describe('GUID', () => {
  it('should be 36 characters long', () => {
    expect(generateGuid()).toHaveLength(36)
  })
})