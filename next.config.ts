import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GramJS usa APIs nativas do Node; não deve ser empacotado pelo bundler.
  serverExternalPackages: ["telegram"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
