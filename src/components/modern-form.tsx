/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import simulatedApi from "../api/api";
import type { FormData } from "../types/types";

// 🎯 Schema-first approach - this defines EVERYTHING!
const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "You must be at least 18 years old"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Gender is required" }),
  }),
  address: z.object({
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
  }),
  hobbies: z
    .array(
      z.object({
        name: z.string().min(1, "Hobby name is required"),
      })
    )
    .min(1, "At least one hobby is required"),
  startDate: z.date(),
  subscribe: z.boolean(),
  referral: z.string().default(""),
});

const FormikWithZod: React.FC = () => {
  // ✨ Single hook replaces all that useState mess!
  const formik = useFormik<FormData>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 18,
      gender: "",
      address: { city: "", state: "" },
      hobbies: [{ name: "" }],
      startDate: new Date(),
      subscribe: false,
      referral: "",
    },

    // 🎯 Schema validation - no more manual validation!
    validationSchema: toFormikValidationSchema(formSchema),

    // 🎯 Clean submission handler
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        const response = await simulatedApi(values);
        console.log("Success:", response);
      } catch (error: any) {
        console.error("Error:", error);
        setFieldError("root" as any, error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // 🚀 Destructure formik for cleaner code!
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = formik;

  return (
    <FormikProvider value={formik}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 5 }}
      >
        <div>
          <label>First Name</label>
          <input
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.firstName && errors.firstName && (
            <p style={{ color: "orangered" }}>{errors.firstName}</p>
          )}
        </div>

        <div>
          <label>Last Name</label>
          <input
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.lastName && errors.lastName && (
            <p style={{ color: "orangered" }}>{errors.lastName}</p>
          )}
        </div>

        <div>
          <label>Email</label>
          <input
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email && (
            <p style={{ color: "orangered" }}>{errors.email}</p>
          )}
        </div>

        <div>
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={values.age}
            onChange={(e) =>
              setFieldValue("age", parseInt(e.target.value) || 0)
            }
            onBlur={handleBlur}
          />
          {touched.age && errors.age && (
            <p style={{ color: "orangered" }}>{errors.age}</p>
          )}
        </div>

        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={values.gender}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {touched.gender && errors.gender && (
            <p style={{ color: "orangered" }}>{errors.gender}</p>
          )}
        </div>

        <div>
          <label>Address</label>
          <input
            name="address.city"
            value={values.address.city}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="City"
          />
          {touched.address?.city && errors.address?.city && (
            <p style={{ color: "orangered" }}>{errors.address.city}</p>
          )}

          <input
            name="address.state"
            value={values.address.state}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="State"
          />
          {touched.address?.state && errors.address?.state && (
            <p style={{ color: "orangered" }}>{errors.address.state}</p>
          )}
        </div>

        <div>
          <label>Start Date</label>
          <DatePicker
            selected={values.startDate}
            onChange={(date: Date | null) =>
              setFieldValue("startDate", date || new Date())
            }
          />
        </div>

        <div>
          <label>Hobbies</label>
          <FieldArray name="hobbies">
            {({ push, remove }) => (
              <div>
                {values.hobbies.map((hobby, index) => (
                  <div key={index}>
                    <input
                      name={`hobbies[${index}].name`}
                      value={hobby.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Hobby Name"
                    />
                    {touched.hobbies?.[index]?.name &&
                      errors.hobbies?.[index] &&
                      typeof errors.hobbies[index] === "object" &&
                      (errors.hobbies[index] as any)?.name && (
                        <p style={{ color: "orangered" }}>
                          {(errors.hobbies[index] as any)?.name}
                        </p>
                      )}

                    {values.hobbies.length > 1 && (
                      <button type="button" onClick={() => remove(index)}>
                        Remove Hobby
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => push({ name: "" })}>
                  Add Hobby
                </button>
              </div>
            )}
          </FieldArray>
        </div>

        <div>
          <label htmlFor="sub">Subscribe to Newsletter</label>
          <input
            type="checkbox"
            id="sub"
            name="subscribe"
            checked={values.subscribe}
            onChange={handleChange}
          />
        </div>

        {values.subscribe && (
          <div>
            <label>Referral Source</label>
            <input
              name="referral"
              value={values.referral}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="How did you hear about us?"
            />
            {touched.referral && errors.referral && (
              <p style={{ color: "orangered" }}>{errors.referral}</p>
            )}
          </div>
        )}

        {(errors as any).root && (
          <p style={{ color: "red" }}>{(errors as any).root}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </FormikProvider>
  );
};

export default FormikWithZod;
