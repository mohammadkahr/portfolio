/**
 * resumeOverrides merge engine.
 *
 * Applied on top of the *localized* profile, only when generating a resume.
 * Rules:
 *   - plain object  → deep-merged key by key
 *   - array/scalar  → replaces the target value
 *   - null          → removes the key
 *   - array operators (target must be an array of objects with `id`):
 *       { "$only":    ["id", ...] }          keep (and order) just these ids
 *       { "$hide":    ["id", ...] }          drop these ids
 *       { "$patch":   { "id": { ...merge } } } deep-merge into matching items
 *       { "$append":  [ ...items ] }         add items at the end
 *       { "$prepend": [ ...items ] }         add items at the start
 *       { "$replace": [ ...items ] }         replace the whole array
 *     Operators can be combined; they run in the order listed above
 *     ($replace first when present).
 */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const OPS = ['$replace', '$only', '$hide', '$patch', '$append', '$prepend']
const isArrayOps = (v) => isPlainObject(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => OPS.includes(k))

function applyArrayOps(target = [], ops) {
  let arr = Array.isArray(ops.$replace) ? [...ops.$replace] : [...target]
  if (Array.isArray(ops.$only)) {
    const byId = new Map(arr.map((item) => [item?.id, item]))
    arr = ops.$only.map((id) => byId.get(id)).filter(Boolean)
  }
  if (Array.isArray(ops.$hide)) arr = arr.filter((item) => !ops.$hide.includes(item?.id))
  if (isPlainObject(ops.$patch)) {
    arr = arr.map((item) => (item && ops.$patch[item.id] ? deepMerge(item, ops.$patch[item.id]) : item))
  }
  if (Array.isArray(ops.$append)) arr = [...arr, ...ops.$append]
  if (Array.isArray(ops.$prepend)) arr = [...ops.$prepend, ...arr]
  return arr
}

export function deepMerge(target, patch) {
  if (patch === undefined) return target
  if (isArrayOps(patch)) return applyArrayOps(Array.isArray(target) ? target : [], patch)
  if (!isPlainObject(patch) || !isPlainObject(target)) return structuredClone(patch)
  const out = { ...target }
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete out[key]
    else out[key] = deepMerge(target[key], value)
  }
  return out
}
