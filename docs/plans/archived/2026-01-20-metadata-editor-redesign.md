# MetadataEditor Redesign Plan

## 1. Overview
The goal is to transform `MetadataEditor` from a rigid form (Features + Variants only) into a flexible, multi-view editor that supports:
- **Known Sections**: Specialized UI for common patterns (Features, Variants).
- **Custom Fields**: Generic UI for arbitrary keys (Tags, Warranty, Dimensions).
- **Raw JSON**: Fallback for power users and complex nested structures.
- **Empty State**: Clean UI when no metadata exists.

## 2. Conceptual Model

We treat the `metadata` JSON object as a collection of "Sections" (top-level keys).

### Section Types
1.  **Specialized Sections**: Keys that have dedicated UI editors.
    *   `features`: Key-Value Table.
    *   `variants`: Name + Values List.
    *   *Future extensions*: `dimensions` (L x W x H inputs), `seo` (Title/Desc inputs).
2.  **Generic Sections**: Keys without specialized UI, handled by a generic editor based on value type.
    *   `string`: Input field.
    *   `number`: Input (type=number).
    *   `boolean`: Switch/Checkbox.
    *   `array`: List of primitives (Tags).
    *   `object`: Nested Key-Value list or fallback to Raw JSON snippet.

## 3. UI/UX Strategy

### 3.1. Main Layout
*   **Header**: Title "Product Metadata" + View Switcher (Guided | Raw JSON).
*   **Active Sections List**: Renders a vertical list of cards/blocks for each existing key in `metadata`.
    *   Each block has a header (Key Name) and an action menu (Remove, Rename?).
    *   Render specific editor based on key name (if specialized) or value type (if generic).
*   **Add Section Area**:
    *   A prominent "Add Section" button or dropdown.
    *   **Preset Options**: "Features", "Variants", "Tags", "Warranty".
    *   **Custom Option**: "Custom Field..." -> Prompts for Key Name and Type.

### 3.2. Empty State
If `metadata` is empty `{}`:
*   Show a clean "No metadata defined" state.
*   Show quick action buttons: "Add Features", "Add Variants", "Add Custom Field".
*   Avoid showing empty tables by default.

### 3.3. Raw JSON View
*   A full-width text area (or Monaco editor if feasible, but text area with validation is MVP).
*   **Validation**: Parse JSON on blur/change. Show error message if invalid.
*   **Sync**: Updates the parent `metadata` object state.

## 4. Component Architecture

```tsx
// Container
<MetadataEditor>
  <Tabs>
    <Tab value="guided">
      <SectionList>
        {/* Render Known Sections */}
        {hasFeatures && <FeaturesSection data={features} onChange={...} />}
        {hasVariants && <VariantsSection data={variants} onChange={...} />}
        
        {/* Render Other/Generic Sections */}
        {otherKeys.map(key => (
           <GenericSection key={key} name={key} value={data[key]} onChange={...} />
        ))}
      </SectionList>
      
      <AddSectionDropdown onAdd={handleAdd} />
    </Tab>
    
    <Tab value="raw">
      <JsonEditor value={metadata} onChange={...} />
    </Tab>
  </Tabs>
</MetadataEditor>
```

## 5. Interaction Details

*   **Removing a Section**: Clicking "Remove" on a section (e.g., Features) deletes the key from `metadata`. This effectively "hides" it from the UI, satisfying "Handle empty/missing... gracefully".
*   **Adding a Section**:
    *   Selecting "Features" initializes `metadata.features = {}`.
    *   Selecting "Variants" initializes `metadata.variants = []`.
    *   Selecting "Custom" -> User types key "warranty", chooses "String" -> initializes `metadata.warranty = ""`.

## 6. Implementation Steps

1.  **Refactor Types**: Update `ProductMetadata` to allow arbitrary keys.
2.  **Create Components**:
    *   `SectionWrapper`: Card container with title and remove button.
    *   `GenericEditor`: Component that inspects value type and renders Input/Switch/TagInput.
    *   `JsonEditor`: Textarea with `JSON.stringify` and `JSON.parse` logic + error state.
3.  **Update MetadataEditor**:
    *   Implement View State (`mode`: 'guided' | 'raw').
    *   Implement "Add Section" logic with presets.
    *   Integrate existing `Features` and `Variants` logic into sub-components.

## 7. Recommendations
*   **Preserve Data**: When switching from Raw -> Guided, try to map known keys. If structure is invalid (e.g. `features` is a string instead of object), mark it as "Invalid/Generic" or show a warning.
*   **Unknown Keys**: Treat any key not in `['features', 'variants']` as a Generic Field.
