export type HomepageLocation = {
  city: string
  timeZone: string
}

export type HomepageContent = {
  id: string
  name: string
  eyebrow: string
  role: string
  locations: HomepageLocation[]
  aboutHeadline: string
  aboutNote: string
  currently: string
  interests: string
  instagramLabel: string
  instagramUrl: string
  collageImages: string[]
  updatedAt: string
}

export type UpdateHomepageInput = Omit<HomepageContent, 'id' | 'updatedAt'>
