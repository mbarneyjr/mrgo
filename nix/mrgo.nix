{
  pkgs,
  dev ? false,
  ...
}:
pkgs.buildNpmPackage {
  pname = if dev then "mrgo-dev" else "mrgo";
  version = (builtins.fromJSON (builtins.readFile "${../.}/package.json")).version;
  src = ../.;
  npmDeps = pkgs.importNpmLock { npmRoot = ../.; };
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;
  dontNpmBuild = true;
  dontCheckForBrokenSymlinks = true;
  NODE_ENV = if dev then "development" else "production";
  npmInstallFlags = if dev then [ "--include=dev" ] else [ ];
  npmPruneFlags = if dev then [ "--include=dev" ] else [ ];
  npmPackFlags = if dev then [ "--include=dev" ] else [ ];
  postInstall = ''
    rm -rf $out/lib
    rm -rf $out/bin
    mkdir -p $out/lib/
    find * -exec touch -h -t '197001010000' {} +
    cp -r . $out/lib/
  '';
}
