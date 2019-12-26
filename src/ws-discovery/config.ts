import { XML_PARSER_FN } from '../config/config.default'
import { TimestampMessages } from '../core/interfaces'
import { xmlToOnvifDevice } from '../onvif/parse'

const wsDiscoveryParseToDict =
  (fn: (str: string) => Document) =>
    (msg: TimestampMessages) =>
      msg.reduce((acc, curr) => {
        return {
          ...acc,
          [xmlToOnvifDevice(fn(curr.msg))().urn]: curr.msg
        }
      }, {})

export const DEFAULT_WS_PROBE_CONFIG = {
  PORTS: [3702],
  DEVICES: ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'],
  PARSER: XML_PARSER_FN,
  RESULT_DEDUPE_FN: wsDiscoveryParseToDict(XML_PARSER_FN),
  SOCKET_PROTOCOL: 'udp4'
}
