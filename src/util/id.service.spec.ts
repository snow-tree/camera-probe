import { IdService } from './id.service'

describe(IdService.name, () => {
  const sut = new IdService()

  describe('guid', () => {
    it('should be 36 characters long', () => {
      expect(sut.guid()).toHaveLength(36)
    })
  })
})