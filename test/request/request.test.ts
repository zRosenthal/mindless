import { Event, HttpMethods, Request } from '../../src/request'

import * as TypeMoq from 'typemoq'

function getEvent(): Event {
  return {
    headers: {},
    path: '',
    pathParameters: {},
    requestContext: {},
    resource: '',
    httpMethod: 'GET',
    queryStringParameters: {},
    stageVariables: {},
    body: ''
  }
}

describe('Test request constructor', () => {
  // construct an event object
  // no need to mock just a DTO essentially
  // const eventMock: TypeMoq.IMock<Event> = TypeMoq.Mock.ofType(Event);
  const localEvent: Event = getEvent() // default event with no data.

  test('empty event', () => {
    let request = new Request(localEvent)
    expect(request.path).toBe('')
    expect(request.method).toBe(HttpMethods.GET)
  })

  test('successfully parses json event body', () => {
    let eventWithBody = localEvent
    let body = {
      name: 'zach',
      number: 12345,
      things: ['a', 'b', 'c']
    }
    eventWithBody.body = JSON.stringify(body)

    let request = new Request(eventWithBody)

    expect(request.get('name')).toBe('zach')
    expect(request.get('number')).toBe(12345)
    expect(request.get('things')).toEqual(['a', 'b', 'c'])
  })

  // needed to not break Request.get()
  test('defaults pathParameters, queryStringParameters and headers if null', () => {
    let defaultEvent = localEvent
    defaultEvent.pathParameters = null
    defaultEvent.queryStringParameters = null
    defaultEvent.headers = null

    let request = new Request(defaultEvent)
    expect(() => {
      request.getOrFail('abc')
    }).toThrow(/key not found/)
    expect(request.get('abc')).toBe(undefined)
  })
})

describe('Test request get method ', () => {
  const localEvent = getEvent()
  test('get added params', () => {
    let defaultEvent = Object.assign({}, localEvent)
    let request = new Request(defaultEvent)
    request.add('param', 'abc')

    let actualRetrievedValue = request.get('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('get query string parameters', () => {
    let defaultEvent = getEvent()
    defaultEvent.queryStringParameters['param'] = 'abc'

    let request = new Request(defaultEvent)

    let actualRetrievedValue = request.get('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('get body parameters', () => {
    let defaultEvent = getEvent()

    defaultEvent.body = JSON.stringify({ param: 'abc' })

    let request = new Request(defaultEvent)

    let actualRetrievedValue = request.get('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('getOrFail retrieve body parameters', () => {
    let defaultEvent = getEvent()

    defaultEvent.body = JSON.stringify({ param: 'abc' })

    let request = new Request(defaultEvent)

    let actualRetrievedValue = request.getOrFail('param')

    expect(actualRetrievedValue).toBe('abc')
  })

  test('invalid key getOrFail', () => {
    let defaultEvent = getEvent()
    defaultEvent.pathParameters['test'] = 'abc'
    defaultEvent.queryStringParameters['testb'] = 'abc'
    defaultEvent.body = JSON.stringify({ testc: 'abc' })

    let request = new Request(defaultEvent)

    expect(() => {
      request.getOrFail('abc')
    }).toThrow(/key not found/)
  })

  test('key not found returns undefined', () => {
    let defaultEvent = getEvent()
    defaultEvent.pathParameters['test'] = 'abc'
    defaultEvent.queryStringParameters['testb'] = 'abc'
    defaultEvent.body = JSON.stringify({ testc: 'abc' })

    let request = new Request(defaultEvent)

    let retrievedValue = request.get('abc')

    expect(retrievedValue).toBe(undefined)
  })
})

describe('Test request header', () => {
  test('invalid key', () => {
    let event = getEvent()
    let request = new Request(event)

    expect(() => {
      request.header('abc')
    }).toThrow(/key not found/)
  })

  test('retrieve header value', () => {
    let event = getEvent()
    event.headers['test'] = 'val'

    let request = new Request(event)

    expect(request.header('test')).toBe('val')
  })
})

describe('Test request add method', () => {
  let event = getEvent()
  let request: Request

  beforeEach(() => {
    // reset request object
    request = new Request(event)
  })

  test('Add new key,val pair', () => {
    request.add('abc', 'val')
    let retrievedVal = request.get('abc')

    expect(retrievedVal).toBe('val')
  })

  test('Add new key,val pair with already existing key', () => {
    request.add('abc', 'val')

    let addKeyAlreadyExists = () => {
      request.add('abc', 'val2')
    }

    expect(addKeyAlreadyExists).toThrow(/key 'abc' already exists/)
    expect(request.get('abc')).toBe('val')
  })

  test('Add new key,val pair with already existing key and overwrite set to true', () => {
    request.add('abc', 'val')
    request.add('abc', 'val2', true)

    expect(request.get('abc')).toBe('val2')
  })

  test('Add multiple key,val pair', () => {
    const map = { abc: 'val', def: 'lav' }
    request.addMultiple(map)

    expect(request.get('abc')).toBe('val')
    expect(request.get('def')).toBe('lav')
  })
})
