var raytraceFS = `

struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
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

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		vec3 C = spheres[i].center;
		float R = spheres[i].radius;
		vec3 oc = ray.pos - C;
		float A = dot(ray.dir, ray.dir);
		float B = 2.0 * dot(oc, ray.dir);
		float Cterm = dot(oc, oc) - R * R;
		float discriminant = B * B - 4.0 * A * Cterm;
		if ( discriminant > 0.0 ) {
			float sqrtD = sqrt(discriminant);
			float t1 = (-B - sqrtD) / (2.0 * A);
			float t2 = (-B + sqrtD) / (2.0 * A);
			float tCandidate = t1;
			if ( tCandidate < EPSILON ) tCandidate = t2;
			if ( tCandidate > EPSILON && tCandidate < hit.t ) {
				// TO-DO: If intersection is found, update the given HitInfo
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

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		vec3 L = normalize( lights[i].position - position );
		Ray shadowRay;
		shadowRay.pos = position + normal * EPSILON;
		shadowRay.dir = L;
		HitInfo shadowHit;
		bool inShadow = false;
		if ( IntersectRay( shadowHit, shadowRay ) ) {
			float distToLight = length( lights[i].position - position );
			if ( shadowHit.t < distToLight ) {
				inShadow = true;
			}
		}
		// TO-DO: If not shadowed, perform shading using the Blinn model
		if ( !inShadow ) {
			float NdotL = max( dot(normal, L), 0.0 );
			vec3 diffuse = mtl.k_d * lights[i].intensity * NdotL;
			vec3 H = normalize( L + view );
			float NdotH = max( dot(normal, H), 0.0 );
			vec3 specular = mtl.k_s * lights[i].intensity * pow( NdotH, mtl.n );
			color += diffuse + specular;
		}
	}
	return color;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		vec3 currPos = hit.position;
		vec3 currNormal = hit.normal;
		vec3 currDir = reflect( ray.dir, currNormal );
		for ( int bounce=1; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce > bounceLimit ) break;
			// TO-DO: Terminate if there is no specular contribution left
			if ( k_s.r + k_s.g + k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.pos = currPos + currNormal * EPSILON;
			r.dir = normalize( currDir );
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				vec3 reflView = normalize( -r.dir );
				vec3 reflColor = Shade( h.mtl, h.position, h.normal, reflView );
				clr += k_s * reflColor;
				// TO-DO: Update the loop variables for tracing the next reflection ray
				k_s *= h.mtl.k_s;
				currPos = h.position;
				currNormal = h.normal;
				currDir = reflect( r.dir, currNormal );
			} else {
				// The reflection ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;