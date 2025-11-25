import { UIConfigField } from '@/lib/config/types';
import SettingsField from '../SettingsField';
import { StorageLimits } from '../StorageLimits';

const Search = ({
  fields,
  values,
}: {
  fields: UIConfigField[];
  values: Record<string, any>;
}) => {
  // Filter out API keys and SearXNG URLs - they should be configured via environment variables only
  const visibleFields = fields.filter(
    (field) => 
      field.key !== 'newsAPIKey' && 
      field.key !== 'parallelAPIKey' &&
      field.key !== 'brightDataAPIKey' &&
      field.key !== 'searxngURL' &&
      field.key !== 'searxngFallbackURL' &&
      field.key !== 'searxngFallbackURLs'
  );

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
      {visibleFields.length > 0 && (
        <>
          {visibleFields.map((field) => (
            <SettingsField
              key={field.key}
              field={field}
              value={
                (field.scope === 'client'
                  ? localStorage.getItem(field.key)
                  : values[field.key]) ?? field.default
              }
              dataAdd="search"
            />
          ))}
          <div className="border-t border-light-200 dark:border-dark-200 mb-6" />
        </>
      )}
      
      <StorageLimits />
    </div>
  );
};

export default Search;
