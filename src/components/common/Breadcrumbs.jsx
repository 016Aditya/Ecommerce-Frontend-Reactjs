import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createBreadcrumbSchema } from '@/config/seoConfig';
import SEO from '@/components/common/SEO';

/**
 * Breadcrumbs Component with JSON-LD Schema
 *
 * Renders semantic breadcrumb navigation with automatic schema markup.
 *
 * Usage:
 *   <Breadcrumbs
 *     items={[
 *       { label: 'Home', path: '/' },
 *       { label: 'Products', path: '/products' },
 *       { label: 'Electronics', path: '/products?category=Electronics' },
 *       { label: 'iPhone 15', path: null, isCurrent: true },
 *     ]}
 *   />
 */
export function Breadcrumbs({ items = [], className = '' }) {
  const schema = useMemo(() => {
    // Filter out current item and items without paths for schema
    const schemaItems = items.filter((item) => item.path);
    return schemaItems.length > 0 ? createBreadcrumbSchema(schemaItems) : null;
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {schema && <SEO schema={schema} />}
      <nav aria-label="breadcrumbs" className={`text-sm ${className}`}>
        <ol
          className="flex flex-wrap items-center gap-2"
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {item.path && !item.isCurrent ? (
                <>
                  <Link
                    to={item.path}
                    className="text-blue-600 hover:underline"
                    style={{
                      color: 'var(--accent, #0066cc)',
                      textDecoration: 'none',
                      opacity: 0.85,
                    }}
                  >
                    {item.label}
                  </Link>
                  {index < items.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{
                        color: 'var(--text-secondary, #999)',
                        margin: '0 6px',
                      }}
                    >
                      /
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span
                    aria-current="page"
                    style={{
                      color: 'var(--text-primary, #333)',
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
