import { flattenBuffersWithInfo } from '../core/probe'

describe('Probe', () => {
  it('should flatten buffers to ports', done => {
    const BUFFER_1 = Buffer.from('123')
    const BUFFER_2 = Buffer.from('456')
    const ADDRESS = '239.255.255.250'
    const SUT = flattenBuffersWithInfo([1900, 2200])(ADDRESS)([BUFFER_1, BUFFER_2])

    expect(SUT[0]).toEqual({ buffer: BUFFER_1, port: 1900, address: ADDRESS })
    expect(SUT[1]).toEqual({ buffer: BUFFER_2, port: 1900, address: ADDRESS })
    expect(SUT[2]).toEqual({ buffer: BUFFER_1, port: 2200, address: ADDRESS })
    expect(SUT[3]).toEqual({ buffer: BUFFER_2, port: 2200, address: ADDRESS })
    done()
  })
})