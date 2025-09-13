{ pkgs, ... }:
pkgs.buildNpmPackage {
  pname = "mrgo-lambda";
  version = (builtins.fromJSON (builtins.readFile "${./.}/package.json")).version;
  src = ../../.;
  npmDeps = pkgs.importNpmLock { npmRoot = ../../.; };
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;
  dontNpmBuild = true;
  npmWorkspace = "packages/lambda";
  nativeBuildInputs = [
    pkgs.zip
  ];
  dontCheckForBrokenSymlinks = true;
  postInstall = ''
    find * -exec touch -h -t '197001010000' {} +
    zip \
      --symlinks -r -D -9 -y --compression-method deflate -X \
      -x @${./.zipignore} @ \
      $out/lambda.zip .
    rm -rf $out/lib
  '';
}
