var raytraceFS = `

struct Ray {
    vec3 pos;
    vec3 dir;
};

struct Material {
    vec3  k_d;
    vec3  k_s;
    float n;
};

struct Sphere {
    vec3     center;
    float    radius;
    Material mtl;
};

struct Light {
    vec3 position;
    vec3 intensity;
};

struct HitInfo {
    float    t;
    vec3     position;
    vec3     normal;
    Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

const float EPSILON = 0.00001;

bool IntersectRay(inout HitInfo hit, Ray ray);

vec3 Shade(Material mtl, vec3 position, vec3 normal, vec3 view) {
    vec3 color = vec3(0.0);
    for (int i = 0; i < NUM_LIGHTS; ++i) {
        vec3 L = normalize(lights[i].position - position);
        Ray shadowRay;
        shadowRay.pos = position + normal * EPSILON;
        shadowRay.dir = L;
        HitInfo shadowHit;
        bool inShadow = false;
        if (IntersectRay(shadowHit, shadowRay)) {
            float distToLight = length(lights[i].position - position);
            if (shadowHit.t < distToLight) {
                inShadow = true;
            }
        }
        if (!inShadow) {
            float NdotL = max(dot(normal, L), 0.0);
            vec3 diffuse = mtl.k_d * lights[i].intensity * NdotL;
            vec3 H = normalize(L + view);
            float NdotH = max(dot(normal, H), 0.0);
            vec3 specular = mtl.k_s * lights[i].intensity * pow(NdotH, mtl.n);
            color += diffuse + specular;
        }
    }
    return color;
}

bool IntersectRay(inout HitInfo hit, Ray ray) {
    hit.t = 1e30;
    bool foundHit = false;
    for (int i = 0; i < NUM_SPHERES; ++i) {
        vec3 C = spheres[i].center;
        float R = spheres[i].radius;
        vec3 oc = ray.pos - C;
        float A = dot(ray.dir, ray.dir);
        float B = 2.0 * dot(oc, ray.dir);
        float Cterm = dot(oc, oc) - R * R;
        float discriminant = B * B - 4.0 * A * Cterm;
        if (discriminant > 0.0) {
            float sqrtD = sqrt(discriminant);
            float t1 = (-B - sqrtD) / (2.0 * A);
            float t2 = (-B + sqrtD) / (2.0 * A);
            float tCandidate = t1;
            if (tCandidate < EPSILON) tCandidate = t2;
            if (tCandidate > EPSILON && tCandidate < hit.t) {
                hit.t = tCandidate;
                foundHit = true;
                hit.position = ray.pos + ray.dir * tCandidate;
                hit.normal = normalize(hit.position - C);
                hit.mtl = spheres[i].mtl;
            }
        }
    }
    return foundHit;
}

vec4 RayTracer(Ray ray) {
    HitInfo hit;
    if (IntersectRay(hit, ray)) {
        vec3 view = normalize(-ray.dir);
        vec3 clr = Shade(hit.mtl, hit.position, hit.normal, view);
        vec3 k_s_accum = hit.mtl.k_s;
        vec3 currPos = hit.position;
        vec3 currNormal = hit.normal;
        vec3 currDir = reflect(ray.dir, currNormal);
        for (int bounce = 1; bounce < MAX_BOUNCES; ++bounce) {
            if (bounce > bounceLimit) break;
            if (k_s_accum.r + k_s_accum.g + k_s_accum.b <= 0.0) break;
            Ray reflRay;
            reflRay.pos = currPos + currNormal * EPSILON;
            reflRay.dir = normalize(currDir);
            HitInfo reflHit;
            if (IntersectRay(reflHit, reflRay)) {
                vec3 reflView = normalize(-reflRay.dir);
                vec3 reflColor = Shade(reflHit.mtl, reflHit.position, reflHit.normal, reflView);
                clr += k_s_accum * reflColor;
                k_s_accum *= reflHit.mtl.k_s;
                currPos = reflHit.position;
                currNormal = reflHit.normal;
                currDir = reflect(reflRay.dir, currNormal);
            } else {
                clr += k_s_accum * textureCube(envMap, reflRay.dir.xzy).rgb;
                break;
            }
        }
        return vec4(clr, 1.0);
    } else {
        return vec4(textureCube(envMap, ray.dir.xzy).rgb, 0.0);
    }
}

`;
