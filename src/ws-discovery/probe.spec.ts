import { flattenBuffersToPorts, exec } from './probe'

describe('Probe', () => {
  it('should flatten buffers to ports', done => {
    const BUFFER_1 = Buffer.from('123')
    const BUFFER_2 = Buffer.from('456')

    const bufferPorts = flattenBuffersToPorts([1900, 2200])([BUFFER_1, BUFFER_2])

    expect(bufferPorts[0]).toEqual( { buffer: BUFFER_1, port: 1900, address: '239.255.255.250' })
    expect(bufferPorts[1]).toEqual( { buffer: BUFFER_2, port: 1900, address: '239.255.255.250' })
    expect(bufferPorts[2]).toEqual( { buffer: BUFFER_1, port: 2200, address: '239.255.255.250' })
    expect(bufferPorts[3]).toEqual( { buffer: BUFFER_2, port: 2200, address: '239.255.255.250' })
    done()
  })

  it.only('a', done => {
    // jest.setTimeout(1000000000)

    const d = exec()
    // console.log(d.map(a => a.toString()))
    // done()
  })
})