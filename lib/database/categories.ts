import { query } from '../database/connection'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await query(`
      SELECT id, name, slug, description, parent_id, created_at, updated_at
      FROM categories
      ORDER BY name
    `)
    return result.rows || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const result = await query(`
      SELECT id, name, slug, created_at
      FROM tags
      ORDER BY name
    `)
    return result.rows || []
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

export async function createCategory(name: string, slug: string, description?: string, parentId?: string): Promise<Category | null> {
  try {
    const result = await query(`
      INSERT INTO categories (name, slug, description, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, slug, description, parentId])
    
    return result.rows[0] || null
  } catch (error) {
    console.error('Error creating category:', error)
    return null
  }
}

export async function createTag(name: string, slug: string): Promise<Tag | null> {
  try {
    const result = await query(`
      INSERT INTO tags (name, slug)
      VALUES ($1, $2)
      RETURNING *
    `, [name, slug])
    
    return result.rows[0] || null
  } catch (error) {
    console.error('Error creating tag:', error)
    return null
  }
}

export async function updateCategory(id: string, name: string, slug: string, description?: string): Promise<Category | null> {
  try {
    const result = await query(`
      UPDATE categories
      SET name = $2, slug = $3, description = $4, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, name, slug, description])
    
    return result.rows[0] || null
  } catch (error) {
    console.error('Error updating category:', error)
    return null
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const result = await query('DELETE FROM categories WHERE id = $1', [id])
    return result.rowCount > 0
  } catch (error) {
    console.error('Error deleting category:', error)
    return false
  }
}

export async function deleteTag(id: string): Promise<boolean> {
  try {
    const result = await query('DELETE FROM tags WHERE id = $1', [id])
    return result.rowCount > 0
  } catch (error) {
    console.error('Error deleting tag:', error)
    return false
  }
}