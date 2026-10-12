import { describe, expect, it } from 'vitest'
import {
  extensionForContentType,
  heroImageContentType,
  heroImageUrlForKey,
  isHeroImageKey,
} from '../server/utils/hero-images'

const KEY = '3f2c1a4e-9b7d-4c6a-8e21-0a1b2c3d4e5f.webp'

describe('isHeroImageKey', () => {
  it('accepts a uuid with a served image extension', () => {
    expect(isHeroImageKey(KEY)).toBe(true)
    expect(isHeroImageKey(KEY.replace('.webp', '.jpg'))).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isHeroImageKey(null)).toBe(false)
    expect(isHeroImageKey('')).toBe(false)
    expect(isHeroImageKey('yoga-with-tash.jpg')).toBe(false)
    expect(isHeroImageKey(KEY.replace('.webp', '.svg'))).toBe(false)
    expect(isHeroImageKey(KEY.replace('.webp', '.jpeg'))).toBe(false)
    expect(isHeroImageKey(`../${KEY}`)).toBe(false)
    expect(isHeroImageKey(`${KEY}/../secret`)).toBe(false)
  })
})

describe('content types', () => {
  it('maps an uploaded type to the key extension', () => {
    expect(extensionForContentType('image/jpeg')).toBe('jpg')
    expect(extensionForContentType('image/png')).toBe('png')
    expect(extensionForContentType('image/svg+xml')).toBeUndefined()
    expect(extensionForContentType(undefined)).toBeUndefined()
  })

  it('maps a key back to the type it is served as', () => {
    expect(heroImageContentType(KEY)).toBe('image/webp')
    expect(heroImageContentType(KEY.replace('.webp', '.jpg'))).toBe('image/jpeg')
  })
})

describe('heroImageUrlForKey', () => {
  it('points at the serving route', () => {
    expect(heroImageUrlForKey(KEY)).toBe(`/images/uploads/${KEY}`)
  })
})
