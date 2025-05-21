"use client";

interface PathParamsProps {
  path: string;
  editable?: boolean;
}

export function PathParams({ path, editable = false }: PathParamsProps) {
  // Extract path parameters (e.g., {id} in /users/{id})
  const pathParams = path.match(/{([^}]+)}/g);

  if (!pathParams) return null;

  return (
    <div className="mb-4">
      <h4 className="text-md font-medium mb-2 text-secondary-text">
        Path Parameters
      </h4>
      <div className="rounded-md border border-divider overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-hover-active border-b border-divider">
            <tr>
              <th className="px-4 py-2 text-left text-secondary-text">Name</th>
              <th className="px-4 py-2 text-left text-secondary-text">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {pathParams.map((param, idx) => {
              const paramName = param.replace(/{|}/g, "");
              return (
                <tr key={idx} className="border-b border-divider last:border-0">
                  <td className="px-4 py-2 font-medium text-primary-text">
                    {paramName}
                  </td>
                  <td className="px-4 py-2 text-secondary-text">
                    Identifier for the {paramName}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
